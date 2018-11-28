# Atom Alloy Tools

This Atom package brings the Alloy modeling language to the Atom Editor. It allows you
to write and run models from within the Atom Editor, and includes special visualization
features for those of us working on modeling finite element meshes.

## Setting up Alloy

**IMPORTANT**: You **_must_** use the following version of Alloy in order to run commands
from within the Atom Editor.

[Click to download alloy.jar](https://github.com/atdyer/org.alloytools.alloy/raw/master/org.alloytools.alloy.dist.jar)

> This package interfaces with Alloy through a special command-line interface that has
> been created specifically for this project. This version of Alloy, which can be found
> [here](https://github.com/atdyer/org.alloytools.alloy), is simply a fork of the official
> Alloy release, found [here](https://github.com/AlloyTools/org.alloytools.alloy). If
> you are interested in the CLI code, you can find it [here](https://github.com/atdyer/org.alloytools.alloy/blob/master/org.alloytools.alloy.application/src/main/java/edu/mit/csail/sdg/alloy4whole/AtomCLI.java).

Once you have downloaded Alloy, navigate to the settings view in Atom 
(```Edit``` -> ```Preferences```). On the left, click on the ```Packages``` button, 
and under ```Community Packages```, you should see the atom-alloy-tools package.
Click on the ```Settings``` button for the package to bring up the package settings
page. On this page you'll see a box for the ```Alloy JAR File```, which is where
you'll need to type the full path to the JAR file on your computer. Once you've done
so, Alloy is ready to go and you can exit the settings window.

## Working with Alloy models

Coming soon...

## Working with Alloy models of meshes

Also coming soon...