// import stream from "stream";

const downloadFile = async (uuid: string) => {
  const response = await fetch(
    `${process.env.STORAGE_API_HOST}/api/v1/attachments/download/${uuid}`,
    {
      method: "GET",
      headers: {
        Accept: "gzip",
      },
    }
  );

  try {
    var blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "file.zip");
    document.body.appendChild(link);
    link.click();
  } catch (e) {
    console.error(e);
  }
};

export default downloadFile;
