# SessionResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**sessionId** | **string** | Идентификатор сессии | [default to undefined]
**expiresAt** | **string** | Время истечения сессии (скользящее окно +30 мин) | [default to undefined]
**user** | **object** | ID пользователя | [default to undefined]

## Example

```typescript
import { SessionResponseDto } from './api';

const instance: SessionResponseDto = {
    sessionId,
    expiresAt,
    user,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
