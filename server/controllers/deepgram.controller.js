import axios from "axios";

export const getDeepgramToken = async (req, res) => {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  console.log("[Deepgram] Token requested by user:", req.user?.uid);
  console.log("[Deepgram] API key present:", !!apiKey, "| length:", apiKey?.length ?? 0);

  if (!apiKey) {
    console.error("[Deepgram] DEEPGRAM_API_KEY not set in server/.env");
    return res.status(500).json({
      message: "Deepgram API key is missing. Please configure DEEPGRAM_API_KEY in your environment variables.",
    });
  }

  try {
    console.log("[Deepgram] Calling Deepgram grant-token API…");
    const response = await axios.post(
      "https://api.deepgram.com/v1/auth/grant",
      {
        ttl_seconds: 30,
      },
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        },
      }
    );

    const token = response.data?.access_token;
    console.log("[Deepgram] ✅ Temp token issued — first 8 chars:", token ? (token.substring(0, 8) + "…") : "none");
    return res.json({ token });
  } catch (err) {
    const status = err.response?.status;
    const errorData = err.response?.data;

    console.error("[Deepgram] Token grant failed:", status, errorData ?? err.message);

    if (status === 401) {
      return res.status(401).json({
        message: "Unauthorized: Invalid Deepgram API key or credentials.",
        details: errorData,
      });
    }

    if (status === 403) {
      return res.status(403).json({
        message: "Forbidden: Access is forbidden. Your Deepgram API key might not have permission to grant temporary tokens.",
        details: errorData,
      });
    }

    if (status === 404) {
      return res.status(404).json({
        message: "Not Found: Deepgram token grant endpoint was not found.",
        details: errorData,
      });
    }

    if (status === 405) {
      return res.status(405).json({
        message: "Method Not Allowed: HTTP method not allowed on Deepgram token grant endpoint.",
        details: errorData,
      });
    }

    return res.status(500).json({
      message: `Deepgram token grant failed: ${err.message}`,
      details: errorData,
    });
  }
};