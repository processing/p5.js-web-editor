# Proposed Public API extensions

This describes proposed extensions to the Public API. None of these extensions are confirmed, but are recorded here for reference and discussion. 

Refer to [Public API](./public_api.md) for the current version of the API.

# Authentication

- Support for sending tokens can via the `Authorization: Bearer {your_access_token}` HTTP header instead of just Basic Auth

# API Access

- API writes are rate-limited to X per second, per access token
- Operations are transactional, e.g. if a file is somehow invalid, the sketch won’t be left partially uploaded

# Proposed API endpoints

## Sketches

## `GET /:user/sketches/:id`

Fetch a sketch.

### Request format
No body.

### Response format
Returns `Sketch`.

### Example

    GET /p5/sketches/Ckhf0APpg
    
    {
      "name": "Another title",
      "slug": "example-1",
      "files": {
        "index.html": { "<DOCTYPE html!><body>Hallo!</body></html>" },
        "something.js": { "var uselessness = 12;" }
      }
    }

### Responses

| HTTP code     | Description                  |
| ------------- | ---------------------------- |
| 200 OK        | Returns ID of created sketch |
| 404 Not Found | Sketch does not exist        |


## `PUT /:user/sketches/:id`

Replace the sketch with an entirely new one, maintaining the same ID. Any existing files will be deleted before the new ones are created.

### Request format
See `Sketch` in Models above.

### Response format
No body.

### Example

    PUT /p5/sketches/Ckhf0APpg
    
    {
      "name": "Another title",
      "files": {
        "index.html": { "content": "<DOCTYPE html!><body>Hallo!</body></html>" },
        "something.js": { "content": "var uselessness = 12;"
      }
    }

### Responses

| HTTP code                | Description                                  |
| ------------------------ | -------------------------------------------- |
| 200 OK                   |                                              |
| 404 Not Found            | Sketch does not exist                        |
| 422 Unprocessable Entity | file validation failed, unsupported filetype |


## `PATCH /:user/sketches/:id`

Update the sketch whilst maintaining existing data:

- Change the name
- Update file’s contents or add new files

### Request format
See `Sketch` in Models above.

### Response format
No body.

### Example
Change the name of the sketch

    PATCH /p5/sketches/Ckhf0APpg
    
    {
      "name": "My Very Lovely Sketch"
    }

### Example
Add a file to a sketch, or replace an existing file.

    PATCH /p5/sketches/Ckhf0APpg
    
    {
      "files": {
        "index.html": { "content": "My new content" }, // contents will be replaced
        "new-file.js": { "content": "some new stuff" } // new file will be added
      }
    }

### Responses

| HTTP code                | Description               |
| ------------------------ | ------------------------- |
| 200 OK                   | Change were made          |
| 404 Not Found            | Sketch does not exist     |
| 422 Unprocessable Entity | Validation error of files |


## Operating on files within a sketch

Files within a sketch can be individually accessed via their `path` e.g. `data/something.json`.

## `GET /:user/sketches/:id/files/:path`

Fetch the contents of a file.

### Request format
No body.

### Response format
Returns file contents.

### Example

    GET /p5/sketches/Ckhf0APpg/files/assets/something.js
    
    Content-Type: application/javascript
    
    var uselessness = 12;

### Responses

| HTTP code     | Description                                                              |
| ------------- | ------------------------------------------------------------------------ |
| 200 OK        | Returns body of the file with the content-type set by the file extension |
| 404 Not Found | File does not exist                                                      |


## `PATCH /:user/sketches/:id/files/:path` 

Update the name or contents a file or directory.

### Request format
See `File` and `Directory` above.

### Response format
No body.

### Example: Change file name

    PATCH /p5/sketches/Ckhf0APpg/files/assets/something.js
    
    {
      "name": "new-name.js"
    }

File `assets/something.js` → `assets/new-name.js`.

### Example: Change file contents

    PATCH /p5/sketches/Ckhf0APpg/files/assets/something.js
    
    {
      "content": "var answer = 24;"
    }

Content of `assets/something.js` will be replaced with `var answer = 24;`.

### Example: Create directory

    PATCH /p5/sketches/Ckhf0APpg/files/assets
    {
      "files": {
        "info.csv": { "content": "some,good,data" }
      }
    }

`assets/data/info.csv` will now exist with the content `some,good,data`

Files are added to the directory, in addition to what is there.

### Responses

| HTTP code                | Description                |
| ------------------------ | -------------------------- |
| 200 OK                   | The changes have been made |
| 404 Not Found            | Path does not exist        |
| 422 Unprocessable Entity | Validation error of files  |


## `DELETE /:user/:sketches/files/:path`

Delete a file/directory, and it’s contents.

### Request format
No body.

### Response format
No body.

### Example: Delete file

    DELETE /p5/sketches/Ckhf0APpg/files/assets/something.js

`assets/something.js` will be removed from the sketch.

### Example: Delete directory


    DELETE /p5/sketches/Ckhf0APpg/files/assets

The `assets` directory and everything within it, will be removed.

### Responses

| HTTP code     | Description               |
| ------------- | ------------------------- |
| 200 OK        | The item has been deleted |
| 404 Not Found | Path does not exist       |



