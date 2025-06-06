const { AlbJwtVerifier, CognitoJwtVerifier } = require("aws-jwt-verify");

const verifier = AlbJwtVerifier.create({
  albArn: process.env.ALB_ARN,
  issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID || ""}`,
  clientId: process.env.COGNITO_USER_POOL_CLIENT_ID || "",
});

const cognitoVerifier = CognitoJwtVerifier.create({
    tokenUse: "access", // id doesn't contain groups
    groups: ["admin", "reviewer"], // this is optional
    // these 2 below will throw errors if not set
    userPoolId: process.env.COGNITO_USER_POOL_ID || "",
    clientId: process.env.COGNITO_USER_POOL_CLIENT_ID || "",
  });

async function verifyJwt(req, res) {
  try {
    const encoded_jwt = req.headers["x-amzn-oidc-data"];
    const access_token = req.headers["x-amzn-oidc-accesstoken"];
    console.log("encoded_jwt", encoded_jwt); // logging for local development
    console.log("access_token", access_token);

    const data_payload = await verifier.verify(encoded_jwt);
    console.log("Verified payload:", JSON.stringify(data_payload, null, 2));

    const access_payload= await cognitoVerifier.verify(access_token);
    console.log("Cognito verified payload:", JSON.stringify(access_payload, null, 2));

    
    res.json({
      message: "Protected endpoint accessed successfully",
      user: {
        email: data_payload.email,
        groups: access_payload["cognito:groups"] || [],
      },
    });
  } catch (error) {
    console.log("JWT verification error:", error.message);
    console.log("Full error:", error);
    res.status(401).json({ message: "Unauthorized", error: error.message });
  }
}

module.exports = {
  verifyJwt,
};