'use babel';

export default {
    jar: {
        title: 'Alloy JAR File',
        description: 'DEPRECATED',  // 'The custom Alloy JAR file that includes the Alloy CLI.',
        type: 'string',
        default: 'none'
    },
    command: {
      title: 'Alloy CLI Command',
      description: 'The command used to load the Alloy CLI. The command needed is `java -cp /path/to/alloy.jar edu.mit.csail.sdg.alloy4whole.AtomCLI`',
      type: 'string',
      default: 'none'
    }
}
