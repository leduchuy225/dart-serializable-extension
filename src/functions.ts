import * as vscode from "vscode";

import { lstatSync } from "fs";
import { dirname } from "path";

function isDirectory(path: string): boolean {
  return lstatSync(path).isDirectory();
}

export async function createClassCommand(
  extensionContext: vscode.ExtensionContext,
  context: any,
  disposable: vscode.Disposable
) {
  // prompt for class name
  let fileName = await vscode.window.showInputBox({
    prompt: "Enter your file name",
  });
  if (fileName === undefined) {
    console.log("No file name entered");
    return;
  }

  let className = "";
  let fileNamePartitions = fileName.split("_");

  for (let name in fileNamePartitions) {
    className += name.charAt(0).toUpperCase() + name.slice(1);
  }

  console.log("Snake case: " + fileName);

  // get the path of the right clicked file or directory

  let dir =
    context?.fsPath ?? vscode.window.activeTextEditor?.document.fileName;
  if (dir === undefined) {
    dir = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  }
  if (dir === undefined) {
    console.log("No file path found");
    return;
  }
  dir = dir.replace(/\\/g, "/");

  // if dir is a file, get the directory
  if (!isDirectory(dir)) {
    console.log("File path is a file: " + dir);
    console.log("Getting directory");
    dir = dirname(dir);
    console.log("Directory: " + dir);
  }

  if (!dir.endsWith("/")) {
    dir += "/";
  }

  console.log("Currently opened tab file path: " + dir);
  let path = vscode.Uri.file(dir + fileName + ".dart");
  console.log("File name: " + path.fsPath);

  let contents = `
import 'package:json_annotation/json_annotation.dart';
part '${fileName}.g.dart';

@JsonSerializable()
class ${className} {
${className}();

factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);
Map<String, dynamic> toJson() => _$${className}ToJson(this);
}
    `;

  // create a file in current directory
  await vscode.workspace.fs.writeFile(path, Buffer.from(contents));

  // show file in editor
  vscode.workspace.openTextDocument(path).then((doc) => {
    vscode.window.showTextDocument(doc);
  });

  // show message
  vscode.window.showInformationMessage(`Created file: ${path.fsPath}`);

  extensionContext.subscriptions.push();
}
