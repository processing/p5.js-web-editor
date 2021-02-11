# Public API

This API provides a way to programmatically import data into the p5.js Web Editor.

# Authentication

Access to the API is available via a Personal Access Token, linked to an existing editor user account. Tokens can be created and deleted via logged-in user’s Settings page.

When contacting the API, the username and token must be sent with every request using basic auth.

This involved sending the base64 encoded `${username}:${personalAccessToken}` in the `Authorization` header. For example:
  `Authorization: Basic cDU6YWJjMTIzYWJj`

# API Access

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
