import {onMounted, reactive} from "vue";
import {DictTypeService} from "@/api/careful-ui/tools/dict_type";

export function useDictAll(dictType: Array<string>) {
  let artDict: any = reactive({});
  onMounted(async () => {
    if (dictType.length > 0) {
      for (const type of dictType) {
        const res: any = await DictTypeService.listAll({dictName: type, status: true});
        if (res.data.length > 0) {
          artDict[type] = res.data.map((item: any) => {
            switch (item.valueType) {
              case 1:
                item.label = item.name;
                item.value = item.strValue;
                return item;
              case 2:
                item.label = item.name;
                item.value = item.intValue;
                return item;
              case 3:
                item.label = item.name;
                item.value = item.boolValue;
                return item;
            }
          });
        }
      }
    }
  });
  return {artDict};
}

export async function useDictTypeList(value: any, dictName: string) {
  const res: any = await DictTypeService.listAll({dictName: dictName, status: true});
  if (!Array.isArray(res.data) || res.data.length === 0) {
    return undefined;
  }
  switch (typeof value) {
    case "string":
      console.log(res.data.find((item: any) => item.strValue.toString() == value.toString()));
      return res.data.find((item: any) => item.strValue.toString() == value.toString());
    case "number":
      console.log(res.data.find((item: any) => item.strValue.toString() == value.toString()));
      return res.data.find((item: any) => item.intValue.toString() == value.toString());
    case "boolean":
      console.log(res.data.find((item: any) => item.strValue.toString() == value.toString()));
      return res.data.find((item: any) => item.boolValue.toString() == value.toString());
    default:
      return undefined;
  }
}
