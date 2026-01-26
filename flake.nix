{
  description = "System Visualizer Development Environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22 # Latest LTS or suitable version
            just
          ];

          shellHook = ''
            echo "Environment loaded."
            echo "Node version: $(node --version)"
            echo "Use 'just' to see available commands."
          '';
        };
      }
    );
}
