const cookieOptions = (req) => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction && req.hostname !== "localhost",
    sameSite: "Strict",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari
  };
};

export default cookieOptions;
