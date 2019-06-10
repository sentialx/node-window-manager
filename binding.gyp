{
  "targets": [
    {
      "target_name": "addon",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "conditions":[
        ["OS=='win'", {
      	  "sources": [ "lib/windows.cc" ]
      	}],
        ["OS=='mac'", {
      	  "sources": [ "lib/macos.mm" ],
          "libraries": [ '-framework AppKit' ]
      	}]
      ], 
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    }
  ]
}