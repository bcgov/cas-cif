import {useMemo} from 'react';
import { WidgetProps } from "@rjsf/core";
import Input from "@button-inc/bcgov-theme/Input";
import Grid from '@button-inc/bcgov-theme/Grid';
import getRequiredLabel from "lib/theme/utils/getRequiredLabel";
import { graphql, useFragment } from "react-relay";

const TextWidget: React.FC<WidgetProps> = ({
  id,
  placeholder,
  onChange,
  label,
  value,
  required,
  formContext
}) => {
  const { allFundingStreamRfps } = useFragment(
    graphql`
      fragment GeneratedLongIdWidget_query on Query {
        allFundingStreamRfps {
          edges {
            node {
              rowId
              year
              fundingStreamId
            }
          }
        }
      }
    `,
    formContext.query
  );

  let fundingStreamRfp = useMemo(() => {
    return allFundingStreamRfps.edges.find(
      ({ node }) => node.rowId === formContext.form.fundingStreamRfpId
    );
  }, [allFundingStreamRfps.edges, formContext.form.fundingStreamRfpId]);

  return (
    <>
      <label htmlFor={id}>{getRequiredLabel(label, required)}</label>
      <small>&nbsp;(year - RFP - stream id - random digits - operator code)</small>
      <Grid>
        <Grid.Row style={{alignItems: 'center'}}>
            {fundingStreamRfp?.node?.year || '(YEAR)'}&nbsp;-&nbsp;RFP&nbsp;-&nbsp;{fundingStreamRfp?.node?.fundingStreamId || '(STREAM ID)'}&nbsp;-&nbsp;
          <span className='random-digits'>
            <Input
              id={id}
              onChange={(e) => onChange(e.target.value || undefined)}
              placeholder={placeholder}
              value={value || ""}
              size={"medium"}
              required={required}
            />
            </span>
            &nbsp;-&nbsp;{formContext.operatorCode || '(OPERATOR CODE)'}
        </Grid.Row>
      </Grid>
      <style jsx>
        {`
          .random-digits {
            width: 4em;
          }
        `}
      </style>
    </>
  );
};

export default TextWidget;

