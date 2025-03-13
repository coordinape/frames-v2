module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coordinape-prod.s3.amazonaws.com",
        port: "",
        pathname: "/**",
        search: "",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
    localPatterns: [
      {
        pathname: "/**",
        search: "",
      },
    ],
  },
};
