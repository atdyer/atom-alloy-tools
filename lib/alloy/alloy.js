'use babel';

const { Emitter } = require('event-kit');
const { spawn } = require('child_process');

import { AlloyInfo } from "./alloy-info";
import { AlloyError } from "./alloy-error";
import { AlloyCommand, AlloyCommandList } from "./alloy-command";
import { AlloySolution } from "./alloy-solution";
import { AlloyTask } from "./alloy-task";


class Alloy {

    _emitter;

    _jar;
    _alloy;
    _parser;
    _pending;
    _queue;
    _quitting;


    constructor () {

        this._emitter = new Emitter();
        this._parser = new Parser((item) => this._onParse(item));
        this._pending = false;
        this._queue = [];
        this._quitting = false;

    }

    displaySolution () {
        this._enqueue(
            new AlloyTask(
                'd',
                'Displaying last instance'
            )
        );
    }

    executeCommand (command) {
        if (command instanceof AlloyCommand)
            this._enqueue(
                new AlloyTask(
                    'e ' + command.index,
                    'Executing ' + command.command
                )
            );
    }

    listCommands () {
        this._enqueue(
            new AlloyTask(
                'c',
                'Retrieving list of commands'
            )
        );
    }

    nextSolution () {
        this._enqueue(
            new AlloyTask(
                'n',
                'Retrieving next solution'
            )
        )
    }

    setFile (file) {
        this._enqueue(
            new AlloyTask(
                'm ' + file,
                'Setting file to ' + file
            )
        );
    }

    setJar (jar) {

        this._jar = jar;

        if (jar && jar.split('.').pop() === 'jar') {

            this._alloy = spawn('java', [
                '-cp',
                jar,
                'edu.mit.csail.sdg.alloy4whole.AtomCLI'
            ]);

            this._alloy.stdout.on('data', (data) => this._onDat(data));
            this._alloy.stderr.on('data', (data) => this._onErr(data));
            this._alloy.on('close', (code, signal) => this._onExit(code, signal));
            this._alloy.on('exit', (code, signal) => this._onExit(code, signal));

            if (this._alloy) {

                this._emitter.emit('info', new AlloyInfo(null, 'Successfully connected to Alloy subprocess'));
                this._dequeue();

            } else {

                this._emitter.emit('error', new AlloyError(null, 'Unable to connect to Alloy subprocess'));

            }

        } else {

            this._emitter.emit('error', new AlloyError(null, 'Invalid .jar file'));

        }

    }

    terminate () {
        this._emitter.dispose();
        this._quitting = true;
        this._enqueue('q');
    }

    onBusy (callback) {
        return this._emitter.on('busy', callback);
    }

    onError (callback) {
        return this._emitter.on('error', callback);
    }

    onFile (callback) {
        return this._emitter.on('file', callback);
    }

    onInfo (callback) {
        return this._emitter.on('info', callback);
    }

    onList (callback) {
        return this._emitter.on('list', callback);
    }

    onReady (callback) {
        return this._emitter.on('ready', callback);
    }

    onSolution (callback) {
        return this._emitter.on('solution', callback);
    }


    _dequeue () {

        // Only dequeue if alloy is ready
        if (this._alloy && !this._pending) {

            // Set to busy
            this._pending = true;

            // Get the next command
            let command = this._queue.shift();

            if (command && command instanceof AlloyTask) {

                // Let everyone know we're busy
                this._emitter.emit('busy', command);

                // Send the command to alloy
                this._write(command);

            } else {

                this._pending = false;

                // Let everyone know we're ready
                this._emitter.emit('ready');

            }

        }

    }

    _enqueue (command) {
        this._queue.push(command);
        this._dequeue();
    }

    _onDat (data) {

        this._parser.pushData(`${data}`);

    }

    _onErr (data) {

        this._emitter.emit('error', new AlloyError(this._parser.file, `${data}`));

    }

    _onParse (item) {

        if (item instanceof AlloyInfo)
            this._emitter.emit('info', item);

        if (item instanceof AlloyError)
            this._emitter.emit('error', item);

        if (item instanceof Array && item.every(cmd => cmd instanceof AlloyCommand))
            this._emitter.emit('list', item);

        if (item instanceof AlloySolution)
            this._emitter.emit('solution', item);

        this._pending = false;
        this._dequeue();

    }

    _onExit (code, signal) {

        code = code !== null ? code : signal;
        code = code || 0;

        this._emitter.emit('info', new AlloyInfo(this._parser.file, `Alloy exited with code ${code}`));

        if (code !== 0 && !this._quitting) this._restart();

    }

    _restart () {

        this._parser.reset();
        this._pending = false;
        this._queue = [];
        this.setJar(this._jar);

        this._emitter.emit('info', new AlloyInfo(this._parser.file, 'Alloy Restarted'));

    }

    _write (command) {

        if (this._alloy)
            this._alloy.stdin.write(command.command + '\n');

    }

}

class Parser {

    file;
    _onParsed;
    _currLines = [];
    _nextLines = [];

    constructor (onParsedCallback) {
        this._onParsed = onParsedCallback;
    }

    pushData (data) {

        let new_lines = remove_empty_strings(data.trim().split(/\r?\n/g)),
            end_index = new_lines.indexOf('CLI READY');

        if (end_index === -1) {
            this._currLines = this._currLines.concat(new_lines);
        } else {
            this._currLines = this._currLines.concat(new_lines.slice(0, end_index));
            this._nextLines = new_lines.slice(end_index + 1);
            this._parse();
        }

    }

    reset () {

        this.file = null;
        this._currLines = [];
        this._nextLines = [];

    }

    _parse () {

        if (this._currLines.length > 0) {

            switch (this._currLines[0]) {

                case 'c':
                    this._post(this._currLines.slice(1).map(line => new AlloyCommand(this.file, line)));
                    break;

                case 'e':
                    this._post(new AlloyError(this.file, this._currLines.slice(1).join('\n')));
                    break;

                case 'i':
                    this._post(new AlloyInfo(this.file, 'Alloy ready'));
                    break;

                case 'm':
                    if (this._currLines.length === 2) {
                        this.file = this._currLines[1];
                        this._post(new AlloyInfo(this.file, 'Model set to ' + this.file));
                    } else {
                        this._post(new AlloyError(this.file, 'Error setting model'));
                    }
                    break;

                case 'r':
                    this._post(new AlloySolution(this.file, this._currLines));
                    break;

                default:
                    this._post(new AlloyError(this.file, 'Unknown Command', this._currLines));
                    break;

            }

        }

        this._currLines = this._nextLines;

    }

    _post (item) {
        if (this._onParsed) this._onParsed(item);
    }

}

function remove_empty_strings (lines) {

    while (lines.length) {
        if (lines[lines.length - 1] === '') {
            lines.pop();
        }
        else if (lines[0] === '') {
            lines.shift();
        }
        else {
            break;
        }
    }

    return lines;

}

export {
    Alloy
}