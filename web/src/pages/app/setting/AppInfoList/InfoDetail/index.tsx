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
    <div className={clsx("rounded border border-grayModern-100 px-4 py-4", className)}>
      <Content>
        <Row className="mb-2 h-[20px] flex-none">
          <span className={clsx("relative inline-block text-lg font-medium text-primary-700")}>
            {title}
          </span>
        </Row>
        <Row className="flex">
          <Col className="border-r-2 border-grayModern-200">
            {leftData.map((item) => (
              <div key={item.key} className="flex justify-between">
                <span className="flex-1 text-grayModern-500">{item.key} :</span>
                <span className="flex-1">{item.value}</span>
              </div>
            ))}
          </Col>
          <Col className="pl-6">
            {rightData.map((item) => (
              <div key={item.key} className="flex justify-between">
                <span className="flex-1 text-grayModern-500">{item.key} :</span>
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
