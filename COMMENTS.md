<!-- 
"assets": [
      { "include": "auth/helpers/i18n/**/*", "watchAssets": true }
    ]
-->

<!-- 
"esModuleInterop": true
 -->

<!-- 
{
    "version": 2,
    "builds": [
        {
            "src": "src/main.ts",
            "use": "@vercel/node"
        }
    ],
    "routes": [
        {
            "src": "/(.*)",
            "dest": "src/main.ts",
            "methods": [
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"
            ]
        }
    ]
}
 -->