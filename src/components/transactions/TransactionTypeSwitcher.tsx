import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionType } from "@/types";

interface TransactionTypeSwitcherProps {
  currentType: TransactionType;
  onTypeChange: (type: TransactionType) => void;
}

const TransactionTypeSwitcher: React.FC<TransactionTypeSwitcherProps> = ({
  currentType,
  onTypeChange,
}) => {
  return (
    <Tabs
      value={currentType}
      onValueChange={(value) => onTypeChange(value as TransactionType)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="income">Entrada</TabsTrigger>
        <TabsTrigger value="expense">Saída</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default TransactionTypeSwitcher;