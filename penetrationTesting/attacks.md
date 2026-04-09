### PizzaStealer

| Item           | Result                                           |
| -------------- |--------------------------------------------------|
| Date           | April 8, 2026                                    |
| Target         | pizza.lincstores.click                           |
| Classification | Broken Access Control                            |
| Severity       | 2                                                |
| Description    | Can freely manipulate prices of pizzas |
| Images         | ![img.png](freePizza!.png)                       |
| Corrections    | Double check pricing on server side.             |

### PizzaSneaker
| Item           | Result                                                                                                                                                                                       |
| -------------- |----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Date           | April 8, 2026                                                                                                                                                                                |
| Target         | pizza.lincstores.click                                                                                                                                                                       |
| Classification | Broken Access Control                                                                                                                                                                        |
| Severity       | 3                                                                                                                                                                                            |
| Description    | No password needed to login to the pizza service backend. Works for admin users as well. By using a PUT request to /api/auth with only an email, an attacker can gain access to any account. |
| Images         | ![img.png](noPassword.png)                                                                                                                                                                   |
| Corrections    | Ensure the server validates passwords for all authentication requests.                                                                                                                       |

### PizzaPeeper                                                                                                                                                                                               
|  Item           | Result                                                                                                                                                                                       |
|  -------------- | ---------------------------------------------------------------------------------------------------------------                                                                              |
|  Date           | April 8, 2026                                                                                                                                                                                |
|  Target         | pizza.lincstores.click                                                                                                                                                                       |
|  Classification | Broken Access Control                                                                                                                                                                        |
|  Severity       | 2                                                                                                                                                                                            |
|  Description    | Unauthorized users can view franchise details and store revenue by accessing /api/franchise/:id directly.                                                                                    |
|  Images         | ![img.png](openFranchise.png)                                                                                                                                                                |
|  Corrections    | Implement proper authorization checks on all franchise-related API endpoints to ensure only owners see details.                                                                              |


### FranchiseCrusher
|  Item           | Result                                                                                |
|  -------------- |---------------------------------------------------------------------------------------|
|  Date           | April 8, 2026                                                                         |
|  Target         | pizza.lincstores.click                                                                |
|  Classification | Broken Access Control                                                                 |
|  Severity       | 2                                                                                     |
|  Description    | Unauthorized users can delete franchise by hitting delete/api/franchise/:id directly. |
|  Images         | ![img.png](deleteFranchiseAttack.png)   ![img.png](deletedFranchise.png)                                              |
|  Corrections    | Implement proper authorization checks on all franchise-related API endpoints.         |

### PizzaStackStalker
|  Item           | Result                                         |
|  -------------- |------------------------------------------------|
|  Date           | April 8, 2026                                  |
|  Target         | pizza.lincstores.click                         |
|  Classification | Broken Access Control                          |
|  Severity       | 1                                              |
|  Description    | Unauthorized users can see the stack response. |
|  Images         | ![img.png](stackStalk.png)                     |
|  Corrections    | Ensure safe error reporting.                   |
