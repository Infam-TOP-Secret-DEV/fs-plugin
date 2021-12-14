# File service

- To start the server use:

```sh
$ npm install
$ npm start
```

Best practice Framework

### REST DOCUMENTATION

All documentation is available via:
`/api/documentation`
If you have any errors, check `host` in `swagger.json`.

### DEFAULT SERVER RESPONSES

Default success response (200):

```json
{
  "ok": true,
  "result": {}
}
```

Default error response:

```json
{
  "ok": false,
  "code": 404000,
  "msg": "Not found.",
  "data": {}
}
```

### DEFAULT PAGINATION

`GET - /api/projects?offset=10&limit=10`

Default response with server pagination:

```json
{
  "ok": true,
  "result": {
    "count": 10,
    "data": []
  }
}
```
