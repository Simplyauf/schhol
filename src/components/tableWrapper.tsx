import React, { useState, ReactNode, ReactElement } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

interface ResponsiveTableWrapperProps {
  children: ReactElement;
  breakpoint?: number;
}

const ResponsiveTableWrapper: React.FC<ResponsiveTableWrapperProps> = ({
  children,
}) => {
  const [activeRow, setActiveRow] = useState<number | null>(null);

  const toggleRow = (index: number) => {
    setActiveRow(activeRow === index ? null : index);
  };

  const renderMobileView = () => {
    const headers = React.Children.toArray(
      children.props.children
    )[0] as ReactElement;

    const rows = React.Children.toArray(children.props.children).slice(
      1
    ) as ReactElement[];

    return (
      <div className="space-y-4">
        {rows?.[0]?.props?.children?.length > 0 &&
          rows[0].props.children.map((row: ReactElement, rowIndex: number) => (
            <div
              key={rowIndex}
              className="rounded border  border-[#1f1d1a] p-5 px-2"
            >
              <div
                className="flex cursor-pointer items-center justify-between bg-transparent "
                onClick={() => toggleRow(rowIndex)}
              >
                <div>{React.Children.toArray(row.props.children)[0]}</div>

                {activeRow === rowIndex ? (
                  <IoIosArrowUp className="h-5 w-5" />
                ) : (
                  <IoIosArrowDown className="h-5 w-5" />
                )}
              </div>

              {activeRow === rowIndex && (
                <div className="mt-4 p-1">
                  {React.Children.toArray(row.props.children)
                    .slice(1)

                    .map((cell: ReactNode, cellIndex: number) => {
                      if (React.isValidElement(cell)) {
                        return (
                          <div
                            key={cellIndex}
                            className="font-regular line mb-3 grid w-full grid-cols-2 gap-6 overflow-x-hidden text-ellipsis break-words"
                          >
                            <strong className="line-clamp-2 truncate text-ellipsis break-words">
                              {
                                React.Children.toArray(
                                  headers.props.children.props.children
                                )[cellIndex + 1]
                              }
                            </strong>
                            {cell.props.children}
                          </div>
                        );
                      }
                      return null;
                    })}
                </div>
              )}
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="hidden md:block">{children}</div>
      <div className="md:hidden">{renderMobileView()}</div>
    </div>
  );
};

export default ResponsiveTableWrapper;
