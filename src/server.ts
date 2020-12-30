import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

//importing path and fs modules
import path from 'path';
import fs from 'fs';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1


  app.get("/filteredimage", async (req, res) => {
    let { image_url } = req.query;

    //1. validate the image_url query
    if (!image_url) return res.status(400).send({ message: 'image_url is required.' });

    //2. call filterImageFromURL(image_url) to filter the image from helper function
    let filteredPath: string = await filterImageFromURL(image_url);

    let options = {
      root: '',
      dotfiles: 'deny',
      headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
      }
    }

    //joining path of directory 
    const directoryPath = path.join(__dirname, 'util/tmp');

    //3. send the resulting file in the response
    return res.sendFile(filteredPath, options, function (err) {
      //handleing error
      if (err) return res.status(500).send({ Error: err })

      //passsing directoryPath and callback function
      fs.readdir(directoryPath, (err, files) => {
        //handleing error
        if (err) return console.error({ Error: 'Unable to scan directory: ' + err });

        if (files) {
          let fileArray: string[] = [];
          //listing all files using forEach
          files.forEach(file => {
            //Do something with the file
            console.log(file);
            fileArray.push(path.join(path.resolve(), '/src/util/tmp', file))
          });
          //4. deletes any files on the server on finish of the response
          deleteLocalFiles(fileArray);
        } else {
          console.log('no files found')
        }
      });
    })
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();