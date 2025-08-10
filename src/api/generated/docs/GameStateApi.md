# GameStateApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**gameStateControllerDeleteGameProgress**](#gamestatecontrollerdeletegameprogress) | **DELETE** /api/game-state/progress | Удалить прогресс игры|
|[**gameStateControllerDeletePlayerState**](#gamestatecontrollerdeleteplayerstate) | **DELETE** /api/game-state/player | Удалить состояние игрока|
|[**gameStateControllerGetGameProgress**](#gamestatecontrollergetgameprogress) | **GET** /api/game-state/progress | Получить прогресс игры|
|[**gameStateControllerGetPlayerState**](#gamestatecontrollergetplayerstate) | **GET** /api/game-state/player | Получить состояние игрока|
|[**gameStateControllerUpdateGameProgress**](#gamestatecontrollerupdategameprogress) | **PUT** /api/game-state/progress | Upsert прогресса игры|
|[**gameStateControllerUpdatePlayerState**](#gamestatecontrollerupdateplayerstate) | **PUT** /api/game-state/player | Upsert состояния игрока|

# **gameStateControllerDeleteGameProgress**
> gameStateControllerDeleteGameProgress()


### Example

```typescript
import {
    GameStateApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GameStateApi(configuration);

const { status, data } = await apiInstance.gameStateControllerDeleteGameProgress();
```

### Parameters
This endpoint does not have any parameters.


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
|**204** | Прогресс игры успешно удален. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameStateControllerDeletePlayerState**
> gameStateControllerDeletePlayerState()


### Example

```typescript
import {
    GameStateApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GameStateApi(configuration);

const { status, data } = await apiInstance.gameStateControllerDeletePlayerState();
```

### Parameters
This endpoint does not have any parameters.


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
|**204** | Состояние игрока успешно удалено. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameStateControllerGetGameProgress**
> GameProgressResponseDto gameStateControllerGetGameProgress()


### Example

```typescript
import {
    GameStateApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GameStateApi(configuration);

const { status, data } = await apiInstance.gameStateControllerGetGameProgress();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GameProgressResponseDto**

### Authorization

[session](../README.md#session)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Прогресс игры успешно получен. |  -  |
|**404** | Прогресс игры не найден. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameStateControllerGetPlayerState**
> PlayerStateResponseDto gameStateControllerGetPlayerState()


### Example

```typescript
import {
    GameStateApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GameStateApi(configuration);

const { status, data } = await apiInstance.gameStateControllerGetPlayerState();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PlayerStateResponseDto**

### Authorization

[session](../README.md#session)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Состояние игрока успешно получено. |  -  |
|**404** | Состояние игрока не найдено. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameStateControllerUpdateGameProgress**
> GameProgressResponseDto gameStateControllerUpdateGameProgress(updateGameProgressDto)


### Example

```typescript
import {
    GameStateApi,
    Configuration,
    UpdateGameProgressDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GameStateApi(configuration);

let updateGameProgressDto: UpdateGameProgressDto; //

const { status, data } = await apiInstance.gameStateControllerUpdateGameProgress(
    updateGameProgressDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateGameProgressDto** | **UpdateGameProgressDto**|  | |


### Return type

**GameProgressResponseDto**

### Authorization

[session](../README.md#session)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Прогресс игры успешно обновлен. |  -  |
|**404** | Прогресс игры не найден. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gameStateControllerUpdatePlayerState**
> PlayerStateResponseDto gameStateControllerUpdatePlayerState(updatePlayerStateDto)


### Example

```typescript
import {
    GameStateApi,
    Configuration,
    UpdatePlayerStateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GameStateApi(configuration);

let updatePlayerStateDto: UpdatePlayerStateDto; //

const { status, data } = await apiInstance.gameStateControllerUpdatePlayerState(
    updatePlayerStateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updatePlayerStateDto** | **UpdatePlayerStateDto**|  | |


### Return type

**PlayerStateResponseDto**

### Authorization

[session](../README.md#session)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Состояние игрока успешно обновлено. |  -  |
|**404** | Состояние игрока не найдено. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

