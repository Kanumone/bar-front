# AuthApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authControllerCreateSession**](#authcontrollercreatesession) | **POST** /api/auth/session | Создать/обновить сессию по Telegram ID|
|[**authControllerGetUserInfo**](#authcontrollergetuserinfo) | **GET** /api/auth/user | Получить профиль пользователя по session-id|
|[**authControllerLogout**](#authcontrollerlogout) | **POST** /api/auth/logout | Выйти из сессии|
|[**authControllerValidateSession**](#authcontrollervalidatesession) | **GET** /api/auth/validate | Проверить валидность session-id|

# **authControllerCreateSession**
> SessionResponseDto authControllerCreateSession(createSessionDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    CreateSessionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let createSessionDto: CreateSessionDto; //

const { status, data } = await apiInstance.authControllerCreateSession(
    createSessionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createSessionDto** | **CreateSessionDto**|  | |


### Return type

**SessionResponseDto**

### Authorization

[session](../README.md#session)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Сессия создана или обновлена |  -  |
|**400** | Неверные входные данные |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerGetUserInfo**
> AuthControllerGetUserInfo200Response authControllerGetUserInfo()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let xSessionId: string; // (default to undefined)

const { status, data } = await apiInstance.authControllerGetUserInfo(
    xSessionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xSessionId** | [**string**] |  | defaults to undefined|


### Return type

**AuthControllerGetUserInfo200Response**

### Authorization

[session](../README.md#session)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Профиль пользователя |  -  |
|**400** | Session ID is required |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerLogout**
> authControllerLogout()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let xSessionId: string; // (default to undefined)

const { status, data } = await apiInstance.authControllerLogout(
    xSessionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xSessionId** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[session](../README.md#session)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Сессия завершена |  -  |
|**400** | Session ID is required |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerValidateSession**
> AuthControllerValidateSession200Response authControllerValidateSession()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let xSessionId: string; // (default to undefined)

const { status, data } = await apiInstance.authControllerValidateSession(
    xSessionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **xSessionId** | [**string**] |  | defaults to undefined|


### Return type

**AuthControllerValidateSession200Response**

### Authorization

[session](../README.md#session)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Сессия валидна |  -  |
|**400** | Session ID is required |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

