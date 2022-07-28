class FileCache {
    constructor() {
        this.files = new Map();
    }

    has(filename) {
        return this.files.has(filename);
    }

    get(filename) {
        return this.files.get(filename);
    }

    set(filename, content) {
        this.files.set(filename, content);
    }

    removeFile(filename) {
        this.files.delete(filename);
    }

    renameFile(previous, current) {
        const content = this.files.get(previous);
        if (!content) {
            return;
        }
        this.set(current, content);
        this.removeFile(previous);
    }

    onDelete(event) {
        const files = event.files.map((file) => file.fsPath);
        for (const file of files) {
            this.removeFile(file);
        }
    }

    onRename(event) {
        for (const file of event.files) {
            this.renameFile(file.oldUri.fsPath, file.newUri.fsPath);
        }
    }

    onSave(document) {
        this.set(document.fileName, document.getText());
    }
}

const fileCache = new FileCache();

module.exports = { fileCache };
