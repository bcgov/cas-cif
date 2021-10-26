import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";

import { createRelayDocument, RelayDocument } from "relay-nextjs/document";

interface DocumentProps {
  relayDocument: RelayDocument;
}

class MyDocument extends Document<DocumentProps> {
  static async getInitialProps(ctx: DocumentContext) {
    const relayDocument = createRelayDocument();

    const renderPage = ctx.renderPage;
    ctx.renderPage = () =>
      renderPage({
        enhanceApp: (App) => relayDocument.enhance(App),
      });

    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      relayDocument,
    };
  }

  render() {
    const { relayDocument } = this.props;

    return (
      <Html lang="en">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta charSet="utf-8" />
          <link
            rel="apple-touch-icon"
            href="/icons/bcid-apple-touch-icon.png"
            sizes="180x180"
          />
          <link
            rel="icon"
            href="/icons/bcid-favicon-32x32.png"
            sizes="32x32"
            type="image/png"
          />
          <link
            rel="icon"
            href="/icons/bcid-favicon-16x16.png"
            sizes="16x16"
            type="image/png"
          />
          <link
            rel="mask-icon"
            href="/icons/bcid-apple-icon.svg"
            color="#036"
          />
          <link rel="icon" href="/icons/bcid-favicon-32x32.png" />
          <relayDocument.Script />
        </Head>
        <title>cif</title>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
