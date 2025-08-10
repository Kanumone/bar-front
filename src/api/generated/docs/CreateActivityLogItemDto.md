# CreateActivityLogItemDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**action** | **string** | Действие | [default to undefined]
**details** | **object** | Детали действия | [optional] [default to undefined]
**sceneName** | **string** | Имя сцены | [optional] [default to undefined]
**timestamp** | **string** | Время события на клиенте | [optional] [default to undefined]

## Example

```typescript
import { CreateActivityLogItemDto } from './api';

const instance: CreateActivityLogItemDto = {
    action,
    details,
    sceneName,
    timestamp,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
