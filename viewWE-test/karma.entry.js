const testsContext = require.context('./test/unit', true, /.test.js$/);
testsContext.keys().forEach(testsContext);
