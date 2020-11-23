let express = require('express');
let app = express();
let port = process.env.PORT || 3000;

app.use( express.static(__dirname + '/dist') );

app.listen(port, () => {
  console.log('Server running at http://localhost:', port);
});