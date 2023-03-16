import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";

import { createRelayDocument, RelayDocument } from "relay-nextjs/document";
import { ServerStyleSheet } from "styled-components";

interface DocumentProps {
  relayDocument: RelayDocument;
}

class MyDocument extends Document<DocumentProps> {
  static async getInitialProps(ctx: DocumentContext) {
    const relayDocument = createRelayDocument();
    const sheet = new ServerStyleSheet();

    const renderPage = ctx.renderPage;
    ctx.renderPage = () =>
      renderPage({
        enhanceApp: (App) => (props) => {
          const AppWithRelay = relayDocument.enhance(App);
          return sheet.collectStyles(<AppWithRelay {...props} />);
        },
      });

    const initialProps = await Document.getInitialProps(ctx);
    const styles = (
      <>
        {initialProps.styles}
        {sheet.getStyleElement()}
      </>
    );
    sheet.seal();
    return {
      ...initialProps,
      relayDocument,
      styles,
    };
  }

  render() {
    const { relayDocument } = this.props;

    return (
      <Html lang="en">
        <Head>
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
        <title>CleanBC Industry Fund</title>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
