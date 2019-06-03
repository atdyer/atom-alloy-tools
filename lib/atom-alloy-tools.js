'use babel';

import AlloyConfig from './atom-alloy-tools-config';
import AlloyCLIView from './views/alloy-cli-view';
import AlloyCommandsView from './views/alloy-commands-view';
import AlloySolutionView from './views/alloy-solution-view';
import { AlloyStylesView } from './views/alloy-styles-view';
import { AlloyMeshViewFactory } from "./views/alloy-mesh-view";

import { CompositeDisposable, Disposable, TextEditor } from 'atom';
import { Alloy } from "./alloy/alloy";
import { AlloyCLIModel } from "./models/alloy-cli-model";
import { AlloyCommandsModel } from './models/alloy-commands-model';
import { AlloySolutionModel } from "./models/alloy-solution-model";
import { AlloyMeshModel } from "./models/alloy-mesh-model";

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

    // Layout helpers
    in_default_layout: false,
    in_styles_layout: false,

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

            // View providers
            atom.views.addViewProvider(AlloyMeshModel, AlloyMeshViewFactory),

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
            // atom.config.observe('atom-alloy-tools.jar', (jar) => this.alloy.setJar(jar)),
            atom.config.observe('atom-alloy-tools.command', (command) => this.alloy.setCommand(command)),

            // Observe the active text editor
            atom.workspace.observeActivePaneItem((item) => this.setActiveItem(item))

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
        view.onDisplayInAlloy(() => this.alloy.displaySolution());
        view.onNextSolution(() => this.alloy.nextSolution());
        // view.onOpenMesh((options) => atom.workspace.open(AlloyMeshView.URI, options));

    },

    deactivate () {
        this.alloy.terminate();
        this.general_subscriptions.dispose();
    },

    setActiveItem (item) {

        if (item instanceof TextEditor) {

            this.editor_subscriptions.dispose();
            this.editor_subscriptions = new CompositeDisposable();

            let path = item.getPath();

            this.editor_subscriptions.add(item.onDidChangePath(() => {
                this.setActiveItem(item);
            }));

            if (path && path.split('.').pop() === 'als') {

                this.editor_subscriptions.add(item.onDidSave(() => {
                    this.alloy.setFile(path);
                }));

                this.editor_subscriptions.add(item.onDidChange(() => {
                    this.commands_model.setActive(false);
                }));

                this.alloy.setFile(path);
                this.showDefaultView();

            } else {

                this.alloy.setFile('null');
                atom.workspace.getRightDock().hide();
                this.in_default_layout = false;
                this.in_styles_layout = false;

            }

        }

        if (item instanceof AlloyMeshModel) {

            this.showStylesOnly(item);

        }

    },

    showDefaultView () {

        if (!this.in_default_layout) {

            this.in_default_layout = true;
            this.in_styles_layout = false;

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

        }

    },

    showStylesOnly (mesh_model) {

        if (!this.in_styles_layout) {

            this.in_styles_layout = true;
            this.in_default_layout = false;

            Promise
                .all(atom.workspace.getRightDock().getPanes().map(pane => pane.destroy()))
                .then(() => atom.workspace
                    .open(AlloyStylesView.URI)
                    .then((view) => {
                        if (view.getModel() !== mesh_model) {
                            view.setModel(mesh_model)
                        }
                    })
                );

        } else {

            let view = atom.workspace.paneForURI(AlloyStylesView.URI).itemForURI(AlloyStylesView.URI);

            if (view.getModel() !== mesh_model) {
                view.setModel(mesh_model);
            }

        }

    }

};

function is_alloy_item (item) {
    return (item instanceof AlloyCLIView) ||
        (item instanceof AlloyCommandsView) ||
        (item instanceof AlloySolutionView) ||
        (item instanceof AlloyStylesView);
}
