{pkgs}: {
  deps = [
    pkgs.postgresql
    pkgs.libuuid
    pkgs.pango
    pkgs.cairo
    pkgs.libjpeg
    pkgs.libpng
    pkgs.pkg-config
  ];
}
