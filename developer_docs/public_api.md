# Public API

⚠️: This is currently a proposal, not an API that exists.

# Authentication

- Access to the API is available via a Personal Access Token, linked to an existing editor user account
- Created via a logged-in user’s Settings page
- Tokens can be deleted via the Settings page
- Tokens are presented to the API using basic auth
- Tokens can also be sent via the `Authorization: Bearer {your_access_token}` HTTP header

# API Access

- API writes are rate-limited to X per second, per access token
- Operations are transactional, e.g. if a file is somehow invalid, the sketch won’t be left partially uploaded
- All requests send and receive `Content-Type: application/json` unless otherwise stated

# Versioning

The API is versioned and this version is indicated in the root URL path e.g. version 1 of the API can be found at `http://editor.p5js.org/api/v1`.

You must provide the version number when accessing the API.

| Version | Release date |
| ------- | ------------ |
| v1      | Unreleased   |

# Models

The API accepts and returns the following model objects, as JSON.

## Sketch

| Name  |       Type        |                                     Description                                      |
| ----- | ----------------- | ------------------------------------------------------------------------------------ |
| name  | String            | The sketch’s title                                                                   |
| files | DirectoryContents | The files and directories in this sketch. See `DirectoryContents` for the structure. |
| slug  | String            | A path that can be used to access the sketch                                         |


    {
      "id": String, // opaque ID
      "name: String,
      "files": DirectoryContents,
      "slug": String // optional
    }

### Validations

- `files` must have exactly one top-level file with the `.html` extension. If none is provided, then a default `index.html` and associated `style.css` will be automatically created.
- `slug` must be an URL-safe string
- `slug` must be unique across all user's sketches

## DirectoryContents

A map of filenames to `File` or `Directory`. The key of each item is used as the filename. Using a map ensures that filenames are unique in the directory.


    {
      [String]:  File | Directory
    }


    {
      "sketch.js": { "content": "var answer = 42;" },
      "index.html" { "content": "..." }
    }

## DirectFile

This file is editable in the Editor UI and stored in the Editor's database.

| Name    | Type         | Description                                |
| ------- | ------------ | ------------------------------------------ |
| content | UTF-8 String | The contents of the file as a UTF-8 string |

    {
      "content": String
    }

## ReferencedFile

This file is hosted elsewhere on the Internet. It appears in the Editor's listing and can be referenced using a proxy URL in the Editor.


| Name | Type |                   Description                   |
| ---- | ---- | ----------------------------------------------- |
| url  | URL  | A valid URL pointing to a file hosted elsewhere |

    {
      "url": URL
    }

## File

A `File` is either a `DirectFile` or `ReferencedFile`. The API supports both everywhere.

## Directory

| Name  | Type              | Description                     |
| ----- | ----------------- | ------------------------------- |
| files | DirectoryContents | A map of the directory contents |

    {
      "files": DirectoryContents
    }

# API endpoints

## Sketches


## `GET /:user/sketches`

List a user’s sketches.
This will not return the files within the sketch, just the sketch metadata.

### Request format
No body.

### Response format
    {
      "sketches": Array<Sketch>
    }

### Example

    GET /p5/sketches
    
    {
      "sketches": [
        { "id": "H1PLJg8_", "name": "My Lovely Sketch" },
        { "id": "Bkhf0APpg", "name":  "My Lovely Sketch 2" }
      ]
    }


## `POST /:user/sketches`

Create a new sketch.

A sketch must contain at least one file with the `.html` extension. If none if provided in the payload, a default `index.html` and linked `style.css` file will be created automatically.

### Request format
See `Sketch` in Models above.

### Response format
    {
      "id": String
    }

### Example

    POST /p5/sketches
    
    {
      "name": "My Lovely Sketch",
      "files": {
        "index.html": { "content": "<DOCTYPE html!><body>Hello!</body></html>" },
        "sketch.js": { "content": "var useless = true;" }
      }
    }

`files` can be nested to represent a folder structure. For example, this will create an empty “data” directory in the sketch:


    POST /p5/sketches
    
    {
      "name": "My Lovely Sketch 2",
      "files": [
        {
           "name": "assets",
           "type": "",
           "files": {
            "index.html": { "content": "<DOCTYPE html!><body>Hello!</body></html>" },
            "data": {
              "files": {}
            }
          }
       }
    }

### Responses

|        HTTP code         |                               Body                                |
| ------------------------ | ----------------------------------------------------------------- |
| 201 Created              | id of sketch                                                      |
| 422 Unprocessable Entity | file validation failed, unsupported filetype, slug already exists |


### Examples

    201 CREATED
    
    {
      "id": "Ckhf0APpg"
    }


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


## `DELETE /:user/sketches/:id`

Delete a sketch and all it’s associated files.

### Request format
No body

### Response format
No body

### Example

    DELETE /p5/sketches/Ckhf0APpg

### Responses

| HTTP code     | Description             |
| ------------- | ----------------------- |
| 200 OK        | Sketch has been deleted |
| 404 Not Found | Sketch does not exist   |



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



