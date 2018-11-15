'use babel';

import AlloyCLIView from './views/alloy-cli-view';
import AlloyCommandsView from './views/alloy-commands-view';
import AlloySolutionView from './views/alloy-solution-view';
import AlloyStylesView from './views/alloy-styles-view';

import {CompositeDisposable, Disposable} from 'atom';

export default {

    atomAlloyToolsView: null,
    modalPanel: null,
    subscriptions: null,

    activate (state) {

        this.subscriptions = new CompositeDisposable(
            atom.workspace.addOpener(AlloyCLIView.opener),
            atom.workspace.addOpener(AlloyCommandsView.opener),
            atom.workspace.addOpener(AlloySolutionView.opener),
            atom.workspace.addOpener(AlloyStylesView.opener),
            atom.commands.add('atom-workspace', {
                'atom-alloy-tools:show-default': this.showDefaultView,
                'atom-alloy-tools:show-styles': this.showStylesOnly
            })
        );

        this.subscriptions.add(new Disposable(() => {
            atom.workspace.getPaneItems().forEach(item => {
                if (is_alloy_item(item)) item.destroy();
            });
        }));

        this.showDefaultView();

    },

    deactivate () {
        this.subscriptions.dispose();
    },

    showDefaultView () {

        Promise
            .all(atom.workspace.getRightDock().getPanes().map(pane => pane.destroy()))
            .then(() => {
                atom.workspace.open(AlloyCLIView.URI, {split: 'up', pending: false});
                atom.workspace.open(AlloyCommandsView.URI, {split: 'down', pending: false});
                atom.workspace.open(AlloySolutionView.URI, {split: 'down', pending: false});
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