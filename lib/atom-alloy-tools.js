'use babel';

import AlloyConfig from './atom-alloy-tools-config';
import AlloyCLIView from './views/alloy-cli-view';
import AlloyCommandsView from './views/alloy-commands-view';
import AlloySolutionView from './views/alloy-solution-view';
import AlloyStylesView from './views/alloy-styles-view';

import { CompositeDisposable, Disposable } from 'atom';
import { Alloy } from "./alloy/alloy";
import {AlloyCLIModel} from "./models/alloy-cli-model";

export default {

    // Controllers
    alloy: null,

    // Models
    cli_model: null,

    // Views

    // Atom things
    config: AlloyConfig,
    subscriptions: null,

    activate () {

        // Initialize controllers
        this.alloy = new Alloy();
        // this.alloy.onError(console.log);
        // this.alloy.onReady(() => console.log('Ready'));
        // this.alloy.onBusy(console.log);
        // this.alloy.onFile(console.log);
        // this.alloy.onInfo(console.log);
        this.alloy.onList(console.log);
        // this.alloy.onResult(console.log);

        // Initialize models
        this.cli_model = new AlloyCLIModel(this.alloy);
        // this.cli_model.onUpdate(console.log);

        // Subscribe to Atom events
        this.subscriptions = new CompositeDisposable(
            atom.workspace.addOpener(AlloyCLIView.opener),
            atom.workspace.addOpener(AlloyCommandsView.opener),
            atom.workspace.addOpener(AlloySolutionView.opener),
            atom.workspace.addOpener(AlloyStylesView.opener),
            atom.commands.add('atom-workspace', {
                'atom-alloy-tools:show-default': () => this.showDefaultView(),
                'atom-alloy-tools:show-styles': () => this.showStylesOnly(),
                'atom-alloy-tools:clear-cli': () => this.cli_model.clear()
            })
        );

        this.subscriptions.add(new Disposable(() => {
            atom.workspace.getPaneItems().forEach(item => {
                if (is_alloy_item(item)) item.destroy();
            });
        }));

        this.subscriptions.add(atom.config.observe('atom-alloy-tools.jar', (jar) => this.alloy.setJar(jar)));
        this.subscriptions.add(atom.workspace.observeActiveTextEditor((editor) => this.setActiveEditor(editor)));

        this.showDefaultView();

    },

    connectCLIView (view) {

        view.setModel(this.cli_model);

    },

    deactivate () {
        this.alloy.terminate();
        this.subscriptions.dispose();
    },

    setActiveEditor (editor) {

        let path = editor.getPath();

        if (path && path.split('.').pop() === 'als') {

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
                    .open(AlloyCommandsView.URI, {split: 'down', pending: false});

                atom.workspace
                    .open(AlloySolutionView.URI, {split: 'down', pending: false});

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