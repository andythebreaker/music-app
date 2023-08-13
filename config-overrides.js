const {useBabelRc, override, addBabelPlugins} = require('customize-cra');
module.exports = override(
    ...addBabelPlugins(
        "babel-plugin-preval",
    )
);
