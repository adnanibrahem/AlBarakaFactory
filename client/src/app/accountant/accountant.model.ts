/* eslint-disable @typescript-eslint/no-explicit-any */

export class Agent {
  id!: number;
  title!: string;
  group!: string;
  vehicle!: string;

  address!: string;
  phoneNumber!: string;
  initDenar!: number;
  initDollar!: number;

  branch!: number;
  userAuth!: number;
  denar!: number;
  dollar!: number;

  initId!: number;
  details!: [];
  spinner!: boolean;
  save!: boolean;
  destination!: number| null; 
  destinationTitle!: string;
  salary!: number;
  
}

export class Attendance{
  id!: number;
  agent!: number;
  dateAt!: any;
  workTime!: number;
} 

export class Salary {
  agent!: Agent;
  attendance!: Attendance[];
  addtionMoney!: number;
  balance!: number;
  totalSalary!: number;
 }


export class BalanceDetails {
  denar!: number;
  dollar!: number;
  inOut!: string;
  amountDollar!: number;
  amountDenar!: number;
  date: any;
  toFrom!: string;
  comments!: string;
  seq!: number;
  fatora!: any;
  currency!: boolean;
  items!: any;
}

export class BoxTransaction {
  id!: number;
  fromOther!: boolean;
  toOther!: boolean;
  fromBox!: boolean;
  toBox!: boolean;
  userAuth!: number;
  fromText!: string;
  toText!: string;
  fromAmount!: any;

  fromCurrency!: boolean;
  toCurrency!: boolean;

  toAmount!: any;

  toAgent!: number;
  toAgentTitle!: string;

  fromAgent!: number;
  fromAgentTitle!: string;
  destination!: number | null;
  destinationTitle!: string;

  fromAmountComma!: string;
  toAmountComma!: string;

  category!: number;
  categoryTitle!: string;
  transactionDate!: any;
  dateAt!: any;
  comments!: string;
  showSpinner!: boolean;
  subAccountant!: boolean;
  documents!: Documents[];
}

export class Documents {
  id!: number;
  boxTransaction!: number;
  item!: number;
  agent!: number;
  userId!: number;
  img!: any;
  obj: any;
  objFile: any;
}

export class Material {
  id!: number;
  initId!: number;
  title!: string;
  length!: number;
  width!: number;
  thickness!: number;
  initQuantity!: number;
  initCurrency!: boolean;
  initUnitCostPrice!: number;

  quantity!: number;
  unitcost!: number;
  currency!: number;

  spinner!: boolean;
  details!: [];
}

export class StoreItemDetails {
  quantity!: number;
  balance!: number;
  date: any;
  type!: string;
  comments!: string;
}

export class FatoraItems {
  id!: number;
  fatora!: number;
  rawMaterial!: number;
  rawMaterialTitle!: string;
  productItem!: number;
  productItemTitle!: string;
  uploadWeight!: number;
  downloadWeight!: number;
  cabsa!: number;

  quantity!: number;
  salePrice!: number;
  unitCostPrice!: number;
}

export class Fatora {
  id!: number;
  agent!: number;
  fatoraType!: number;
  agentTitle!: string;
  discount!: number;
  totalPrice!: number;
  paidAmount!: number;
  fatoraDate!: any;
  comments!: string;
  items!: FatoraItems[];
  dateAt!: any;
}

export class BoxBalance {
  denar!: number;
  dollar!: number;
  details!: BoxTransaction[];
}

export class Category {
  id!: number;
  branch!: number;
  title!: string;
  inProfit!: boolean;
  deleted!: boolean;
}

export interface InvoiceItems {
  id: number;
  invoice: number;
  material: number;
  materialTitle: string; // اسم المادة
  quantity: number; // العدد
  unitCostPrice: number;
}

export interface Destination {
  id: number;
  title: string;
  total: number; // المجموع
  save: boolean; // هل تم حفظها
}
export interface Withdraw {
  id: number;
  destination: number;
  destinationTitle: string; // اسم المجهز
  withdrawDate: any; // تاريخ الوصل
  comments: string; // الملاحضات
  items: WithdrawItems[];
}

export interface WithdrawItems {
  id: number;
  withdraw: number;
  material: number;
  materialTitle: string; // اسم المادة
  quantity: number; // العدد
  unitCostPrice: number;
}

export interface Invoice {
  id: number;
  agent: number;
  agentTitle: string; // اسم المجهز
  invoiceDate: any; // تاريخ الوصل
  currency: boolean;
  invoiceCode: string; // رمز الوصل
  totalCost: number; // كلفة الوصل
  comments: string; // الملاحضات
  items: InvoiceItems[];
}

export interface ManufacturingPath {
  id: number;
  order: number;
  orderInfo: any;
  title: string;
  step: string;
  index: number;
  doneAt: any;
  done: boolean;
  deleteByUpdate: boolean;
  userDoneId: number;
  userDoneIdTitle: string;
}

export interface ManufacturingImages {
  id: number;
  order: number;
  obj: any;
  objFile: any;
  image: any;
}
export interface ManufacturingFiles {
  id: number;
  order: number;
  obj: any;
  objFile: any;
  file: any;
}
export interface ManufacturingItems {
  id: number;
  order: number;
  title: string; // اسم المادة
  quantity: number; // العدد  
  unitCostPrice: number; // كلفة الوحدة
  width: number | null; // العرض
  length: number | null; // الطول
  thickness: number | null; // السماكة
  deleted: boolean; // هل تم حذفها
}


export interface ManufacturingOrder {
  id: number;
  agent: number;
  yearId: number; // السنة
  userAuth: number; // السنة
  agentTitle: string; // اسم العميل
  dateAt: any; // تاريخ الطلب
  doneAt: any; // تاريخ الانتهاء
  currency: boolean; // العملة
  price: number; // كلفة الطلب
  otherPrice: number; // كلفة الطلب الآخر
  comments: string; // الملاحظات
  status: string;
  selected: boolean;
  otherOrder: boolean; // طلب آخر
  destination: number | null; // المجهز

  done: boolean;
  paths: ManufacturingPath[];
  images: ManufacturingImages[];
  items: ManufacturingItems[];
  designFile: any;
  fileName: string;
  deleteByUpdate: boolean;
}

