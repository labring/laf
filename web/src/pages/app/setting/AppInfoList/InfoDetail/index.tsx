import clsx from "clsx";

import Content from "@/components/Content";
import { Col, Row } from "@/components/Grid";

const InfoDetail = function (props: {
  title: string;
  className?: string;
  leftData: any[];
  rightData: any[];
}) {
  const { title, leftData, rightData, className } = props;
  return (
    <div className={clsx("mb-6 rounded border-b border-grayModern-100 pb-6", className)}>
      <Content>
        <Row className="mb-2">
          <span className={clsx("relative inline-block text-2xl font-semibold text-primary-700")}>
            {title}
          </span>
        </Row>
        <Row className="flex">
          <Col>
            {leftData.map((item) => (
              <div key={item.key} className="flex justify-between">
                <span className="mr-2 text-grayModern-500">{item.key} :</span>
                <span className="flex-1">{item.value}</span>
              </div>
            ))}
          </Col>
          <Col className="pl-6">
            {rightData.map((item) => (
              <div key={item.key} className="flex justify-between">
                <span className="mr-2 text-grayModern-500">{item.key} :</span>
                <span className="flex-1">{item.value}</span>
              </div>
            ))}
          </Col>
        </Row>
      </Content>
    </div>
  );
};

export default InfoDetail;
