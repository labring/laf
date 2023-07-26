import clsx from "clsx";

import Content from "@/components/Content";
import { Col } from "@/components/Grid";

const InfoDetail = function (props: {
  title: string;
  className?: string;
  data: { key: string; value: string }[];
}) {
  const { title, data, className } = props;
  return (
    <div className={clsx("rounded-xl border p-6", className)}>
      <Content>
        <Col>
          <span className={clsx("mb-5 flex items-center text-lg font-semibold")}>
            <div className="mr-2 h-3 w-1 rounded-xl bg-primary-600" />
            {title}
          </span>
          {data.map((item) => (
            <div key={item.key} className="flex justify-between border-t border-dotted py-2">
              <span className="text-grayModern-500">{item.key}</span>
              <span>{item.value}</span>
            </div>
          ))}
        </Col>
      </Content>
    </div>
  );
};

export default InfoDetail;
