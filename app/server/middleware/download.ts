const downloadFile = async (uuid: string) => {
  const response = await fetch(
    `${process.env.STORAGE_API_HOST}/api/v1/attachments/download/${uuid}`,
    {
      method: "GET",
      headers: {
        "api-key": process.env.STORAGE_API_KEY,
        "Accept-Encoding": "gzip",
      },
    }
  );
  console.log("*********** HEADERS **************");
  console.log(response.headers);
  try {
    return response.arrayBuffer;
  } catch (e) {
    console.error(e);
  }
};

export default downloadFile;
