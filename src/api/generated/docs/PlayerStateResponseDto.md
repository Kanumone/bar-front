# PlayerStateResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | ID состояния игрока | [default to undefined]
**hunger** | **number** | Голод игрока | [default to undefined]
**energy** | **number** | Энергия игрока | [default to undefined]
**money** | **number** | Деньги игрока | [default to undefined]
**inventory** | [**Array&lt;InventoryItemDto&gt;**](InventoryItemDto.md) | Инвентарь | [default to undefined]
**updatedAt** | **string** | Дата и время последнего обновления | [default to undefined]
**user** | [**UserResponseDto**](UserResponseDto.md) | Информация о пользователе | [default to undefined]

## Example

```typescript
import { PlayerStateResponseDto } from './api';

const instance: PlayerStateResponseDto = {
    id,
    hunger,
    energy,
    money,
    inventory,
    updatedAt,
    user,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
