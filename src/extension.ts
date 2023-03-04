// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "dart-json-serializable-snippets" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('dart-json-serializable-snippets.createDartJsonSerializable', async () => {

        // prompt for class name
        let className = await vscode.window.showInputBox({ prompt: 'Enter class name' });
        if (className === undefined) {
            console.log('No class name entered');
            return;
        }

        console.log('Class name entered: ' + className);

        let snakeCase = className.replace(/([A-Z])/g, '_$1').toLowerCase().slice(1);

        console.log('Snake case: ' + snakeCase);

        let currentlyOpenedTabfilePath = vscode.window.activeTextEditor?.document.fileName;
        if (currentlyOpenedTabfilePath === undefined) {
            currentlyOpenedTabfilePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        }
        if (currentlyOpenedTabfilePath === undefined) {
            console.log('No file path found');
            return;
        }
        console.log('Currently opened tab file path: ' + currentlyOpenedTabfilePath);
        currentlyOpenedTabfilePath = currentlyOpenedTabfilePath.replace(/\\/g, '/');
        currentlyOpenedTabfilePath = currentlyOpenedTabfilePath.substring(0, currentlyOpenedTabfilePath.lastIndexOf('/') + 1);
        console.log('Currently opened tab file path: ' + currentlyOpenedTabfilePath);
        let fileName = vscode.Uri.file(currentlyOpenedTabfilePath + snakeCase + '.dart');
        console.log('File name: ' + fileName.fsPath);

        let contents = `
import 'package:json_annotation/json_annotation.dart';
part '${snakeCase}.g.dart';

@JsonSerializable()
class ${className} {
    ${className}();

    factory ${className}.fromJson(Map<String, dynamic> json) => _$${className}FromJson(json);
    Map<String, dynamic> toJson() => _$${className}ToJson(this);
}
        `;

        // create a file in current directory
        await vscode.workspace.fs.writeFile(fileName, Buffer.from(contents));

        // show file in editor
        vscode.workspace.openTextDocument(fileName).then(doc => {
            vscode.window.showTextDocument(doc);
        });

        // show message
        vscode.window.showInformationMessage(
            `Created file: ${fileName.fsPath}`
        );

        context.subscriptions.push(disposable);
    });
}

// This method is called when your extension is deactivated
export function deactivate() { }
