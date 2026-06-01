<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Delete Response Mode
    |--------------------------------------------------------------------------
    |
    | no_content: Keep HTTP 204 empty-body deletes (default, backward compatible).
    | envelope: Return HTTP 200 with the standard success envelope on deletes.
    |
    */
    'delete_response_mode' => env('API_DELETE_RESPONSE_MODE', 'no_content'),
];
