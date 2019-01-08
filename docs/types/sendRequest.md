# sendRequest

Function definition for the sendRequest function. Throughout the `caccl` project, the default sendRequest function is `caccl-send-request`. However, if you want to override this and use your own request sender, it must adhere to the following function description:

Argument | Type | Description | Default
:--- | :--- | :--- | :---
host | string | host to send the request to | none
path | string | path to send the request to | none
method | string | http method to use | GET
params | object | body/data to include in the request | {}
numRetries | number | number of times to retry the request if it fails | 0
ignoreSSLIssues | boolean | if true, ignores self-signed certificate issues | false

Returns:  
`Promise.<CACCLError|object>` Returns promise that resolves with `{ body, status, headers }` on success, rejects with CACCLError (see `caccl-error` on npm) on failure.