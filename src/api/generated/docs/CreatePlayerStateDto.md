# CreatePlayerStateDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**hunger** | **number** | Текущий уровень голода игрока | [default to undefined]
**energy** | **number** | Текущая энергия игрока | [default to undefined]
**money** | **number** | Деньги игрока | [default to undefined]
**inventory** | [**Array&lt;InventoryItemDto&gt;**](InventoryItemDto.md) | Инвентарь игрока | [default to undefined]
**data** | **object** | Дополнительные данные состояния игрока (JSONB) | [default to undefined]

## Example

```typescript
import { CreatePlayerStateDto } from './api';

const instance: CreatePlayerStateDto = {
    hunger,
    energy,
    money,
    inventory,
    data,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
