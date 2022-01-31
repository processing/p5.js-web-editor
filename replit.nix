{ pkgs }: {
	deps = with pkgs; [
		nodejs-12_x
		nodePackages.typescript-language-server
    mongodb
	];
}