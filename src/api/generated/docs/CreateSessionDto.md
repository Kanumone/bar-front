# CreateSessionDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**telegramId** | **string** | Telegram ID пользователя | [default to undefined]
**username** | **string** | Username в Telegram | [optional] [default to undefined]
**firstName** | **string** | Имя | [optional] [default to undefined]
**lastName** | **string** | Фамилия | [optional] [default to undefined]
**userAgent** | **string** | User-Agent клиента | [optional] [default to undefined]
**telegramVersion** | **string** | Версия Telegram | [optional] [default to undefined]

## Example

```typescript
import { CreateSessionDto } from './api';

const instance: CreateSessionDto = {
    telegramId,
    username,
    firstName,
    lastName,
    userAgent,
    telegramVersion,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
