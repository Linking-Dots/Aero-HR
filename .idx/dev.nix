
{pkgs}: {
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs_20
    pkgs.php83
    pkgs.php83Packages.composer
  
  ];
  services.mysql = {
    enable = true;
  };
  idx.extensions = [
    "svelte.svelte-vscode"
    "vue.volar"
    "mtxr.sqltools"
    "mtxr.sqltools-driver-mysql"
  ];
   
  idx.previews = {
    previews = {      
      web = {        
        command = [
          "php" "artisan" "serve" "--host=0.0.0.0" "--port=$PORT" 
        ];
        manager = "web"; 
      };
    };
  };
}
