'use babel';

import AlloyConfig from './atom-alloy-tools-config';
import AlloyCLIView from './views/alloy-cli-view';
import AlloyCommandsView from './views/alloy-commands-view';
import AlloySolutionView from './views/alloy-solution-view';
import AlloyStylesView from './views/alloy-styles-view';

import { CompositeDisposable, Disposable } from 'atom';
import { Alloy } from "./alloy/alloy";
import { AlloyCLIModel } from "./models/alloy-cli-model";
import { AlloyCommandsModel } from './models/alloy-commands-model';
import { AlloySolutionModel } from "./models/alloy-solution-model";

export default {

    // Controllers
    alloy: null,

    // Models
    cli_model: null,
    commands_model: null,
    solution_model: null,

    // Atom things
    config: AlloyConfig,
    editor_subscriptions: null,
    general_subscriptions: null,

    activate () {

        // Initialize controllers
        this.alloy = new Alloy();

        // Initialize models
        this.cli_model = new AlloyCLIModel(this.alloy);
        this.commands_model = new AlloyCommandsModel(this.alloy);
        this.solution_model = new AlloySolutionModel(this.alloy);

        // Subscribe to active editor events
        this.editor_subscriptions = new CompositeDisposable();

        // Subscribe to Atom events
        this.general_subscriptions = new CompositeDisposable(

            // View openers
            atom.workspace.addOpener(AlloyCLIView.opener),
            atom.workspace.addOpener(AlloyCommandsView.opener),
            atom.workspace.addOpener(AlloySolutionView.opener),
            atom.workspace.addOpener(AlloyStylesView.opener),

            // Keyboard shortcuts and menus
            atom.commands.add('atom-workspace', {
                'atom-alloy-tools:show-default': () => this.showDefaultView(),
                'atom-alloy-tools:show-styles': () => this.showStylesOnly(),
                'atom-alloy-tools:clear-cli': () => this.cli_model.clear()
            }),

            // Disposable that will clean up all Alloy views when closing
            new Disposable(() => {
                atom.workspace.getPaneItems().forEach(item => {
                    if (is_alloy_item(item)) item.destroy();
                });
            }),

            // Observe config items
            atom.config.observe('atom-alloy-tools.jar', (jar) => this.alloy.setJar(jar)),

            // Observe the active text editor
            atom.workspace.observeActiveTextEditor((editor) => this.setActiveEditor(editor))

        );

        // Begin with the default view
        this.showDefaultView();

    },

    connectCLIView (view) {

        view.setModel(this.cli_model);

    },

    connectCommandsView (view) {

        view.setModel(this.commands_model);
        view.onSelect((command) => this.alloy.executeCommand(command));

    },

    connectSolutionView (view) {

        view.setModel(this.solution_model);
        view.onView(() => this.alloy.displaySolution());

    },

    deactivate () {
        this.alloy.terminate();
        this.general_subscriptions.dispose();
    },

    setActiveEditor (editor) {

        this.editor_subscriptions.dispose();
        this.editor_subscriptions = new CompositeDisposable();

        let path = editor.getPath();

        if (path && path.split('.').pop() === 'als') {

            this.editor_subscriptions.add(editor.onDidSave(() => {
                this.alloy.setFile(path);
                this.alloy.listCommands();
            }));

            this.editor_subscriptions.add(editor.onDidStopChanging(() => {
                this.commands_model.setActive(false);
            }));

            this.alloy.setFile(path);
            this.alloy.listCommands();
        }

    },

    showDefaultView () {

        Promise
            .all(atom.workspace.getRightDock().getPanes().map(pane => pane.destroy()))
            .then(() => {

                atom.workspace
                    .open(AlloyCLIView.URI, {split: 'up', pending: false})
                    .then((view) => this.connectCLIView(view));

                atom.workspace
                    .open(AlloyCommandsView.URI, {split: 'down', pending: false})
                    .then((view) => this.connectCommandsView(view));

                atom.workspace
                    .open(AlloySolutionView.URI, {split: 'down', pending: false})
                    .then((view) => this.connectSolutionView(view));

            });

    },

    showStylesOnly () {

        Promise
            .all(atom.workspace.getRightDock().getPanes().map(pane => pane.destroy()))
            .then(() => atom.workspace.open(AlloyStylesView.URI));

    }

};

function is_alloy_item (item) {
    return (item instanceof AlloyCLIView) ||
        (item instanceof AlloyCommandsView) ||
        (item instanceof AlloySolutionView) ||
        (item instanceof AlloyStylesView);
}