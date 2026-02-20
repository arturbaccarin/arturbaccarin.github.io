Interfaces oferecem uma forma de especificar o comportamento de um objeto, mesmo que ele ainda não exista.

Elas podem ser utilizadas quando há necessidade de replicar comportamentos, promover o desacoplamento entre componentes ou restringir certas funcionalidades.

Mas surge a pergunta: **onde devemos criá-las?**

A resposta, na maioria dos casos, é: **do lado de quem vai utilizá-las (lado do consumidor)**.

É comum vermos interfaces sendo definidas junto com suas implementações concretas (lado do produtor), mas essa prática não é a mais recomendada em Go. Isso porque ela pode forçar o consumidor a depender de métodos que não precisa, dificultando a flexibilidade e o reuso.

É o consumidor quem deve decidir se precisa de uma abstração e qual deve ser sua forma.

Essa abordagem segue o Princípio de Segregação de Interface (*Interface Segregation Principle*, a letra “I” do SOLID), que estabelece que um cliente não deve ser forçado a depender de métodos que não utiliza.

Portanto, a melhor prática é: o produtor fornece implementações concretas e o consumidor decide como usá-las, inclusive se deseja abstraí-las por meio de interfaces.

## Exemplo

Imagine um sistema em que precisamos gerar um recibo de pedido e para isso precisamos buscar os nomes do cliente e do produto com base em seus respectivos IDs.

**Cenário 1 – Prefira**: Os produtores fornecem a implementação concreta para acesso a esses dados e o consumidor define as interfaces com os métodos que ele utilizará para gerar o recibo.

```go
package product

type Product struct {
    ID   int
    Name string
}

type DB map[int]Product

func NewDB() DB {
    return make(map[int]Product)
}

func (db DB) Add(product Product) {
    db[product.ID] = product
}

func (db DB) Get(id int) Product {
    product := db[id]
    return product
}

func (db DB) Remove(id int) {
    delete(db, id)
}

func (db DB) Update(product Product) {
    if _, exists := db[product.ID]; exists {
        db[product.ID] = product
    }
}
```

```go
package client

type Client struct {
    ID   int
    Name string
}

type DB map[int]Client

func NewDB() DB {
    return make(map[int]Client)
}

func (db DB) Add(client Client) {
    db[client.ID] = client
}

func (db DB) Get(id int) Client {
    client := db[id]
    return client
}

func (db DB) Remove(id int) {
    delete(db, id)
}

func (db DB) Update(client Client) {
    if _, exists := db[client.ID]; exists {
        db[client.ID] = client
    }
}
```

```go
package receipt

import (
    "interface-e-coisa-de-consumidor/prefira/client"
    "interface-e-coisa-de-consumidor/prefira/product"
)

type clientManager interface {
    Get(id int) client.Client
}

type productManager interface {
    Get(id int) product.Product
}

type Receipt struct {
    client  clientManager
    product productManager
}

func New(clientManager clientManager, productManager productManager) *Receipt {
    return &Receipt{
        client:  clientManager,
        product: productManager,
    }
}

func (r *Receipt) Generate(clientID int, productID int) string {
    c := r.client.Get(clientID)

    p := r.product.Get(productID)

    receipt := "Receipt for " + c.Name + " for product " + p.Name
    return receipt
}
```

```go
package main

import (
    "fmt"
    "interface-e-coisa-de-consumidor/prefira/client"
    "interface-e-coisa-de-consumidor/prefira/product"
    "interface-e-coisa-de-consumidor/prefira/receipt"
)

func main() {
    clientDB := client.NewDB()
    productDB := product.NewDB()

    clientDB.Add(client.Client{ID: 1, Name: "John Doe"})
    productDB.Add(product.Product{ID: 1, Name: "Laptop"})

    receipt := receipt.New(clientDB, productDB)

    receiptText := receipt.Generate(1, 1)
    fmt.Println(receiptText)
}
```

**Cenário 2 – Evite**: As interfaces são criadas no lado dos produtores e o pacote `receipt` acaba tendo acesso a métodos que não precisa, o que gera acoplamento desnecessário e fere o princípio de segregação de interface.

```go
package product

type Manager interface {
    Add(product Product)
    Get(id int) Product
    Remove(id int)
    Update(product Product)
}

type Product struct {
    ID   int
    Name string
}

type DB map[int]Product

func NewDB() DB {
    return make(map[int]Product)
}

/*
    Abaixo segue a mesma implementação
    do Cenário 1
*/
```

```go
package client

type Manager interface {
    Add(client Client)
    Get(id int) Client
    Remove(id int)
    Update(client Client)
}

type Client struct {
    ID   int
    Name string
}

type DB map[int]Client

func NewDB() DB {
    return make(map[int]Client)
}

/*
    Abaixo segue a mesma implementação
    do Cenário 1
*/
```

```go
package receipt

import (
    "interface-e-coisa-de-consumidor/evite/client"
    "interface-e-coisa-de-consumidor/evite/product"
)

type Receipt struct {
    client  client.Manager
    product product.Manager
}

func New(clientManager client.Manager, productManager product.Manager) *Receipt {
    return &Receipt{
        client:  clientManager,
        product: productManager,
    }
}

func (r *Receipt) Generate(clientID int, productID int) string {
    c := r.client.Get(clientID)

    p := r.product.Get(productID)

    receipt := "Receipt for " + c.Name + " for product " + p.Name
    return receipt
}
```

```go
package main

import (
    "fmt"
    "interface-e-coisa-de-consumidor/evite/client"
    "interface-e-coisa-de-consumidor/evite/product"
    "interface-e-coisa-de-consumidor/evite/receipt"
)

func main() {
    /*
        Mesma implementação
        do Cenário 1
    */
}
```


Os códigos apresentados estão disponíveis em:  
[https://github.com/arturbaccarin/foi-o-go-que-me-deu/tree/main/interface-e-coisa-de-consumidor](https://github.com/arturbaccarin/foi-o-go-que-me-deu/tree/main/interface-e-coisa-de-consumidor)

## Ponto de exceção

Em alguns contextos específicos, pode fazer sentido definir a interface no lado do produtor. Nesses casos, o ideal é mantê-la o mais enxuta possível, para favorecer a reutilização e facilitar sua composição com outras interfaces.

Por exemplo: um pacote que fornece um cliente HTTP para consumo de uma API externa, como um serviço de pagamentos. Esse pacote pode expor uma interface com métodos como `CreateCharge`, `RefundPayment` e `GetTransactionStatus`, permitindo que qualquer sistema que consuma o pacote saiba exatamente quais operações são suportadas.

Como o próprio pacote é o especialista no domínio da API externa, ele pode definir uma interface enxuta e bem estruturada, facilitando tanto o uso quanto a substituição por implementações *mockadas*.

## Leitura complementar

As abstrações devem ser descobertas e não criadas. Isso significa que não se deve criar abstrações se não há uma real necessidade no momento. Criam-se interfaces quando necessário e não quando se prevê que elas serão utilizadas.

Quando se criam muitas interfaces, o fluxo do código fica mais complexo, dificultando a leitura e o entendimento do sistema.

Se não existe uma razão para definir uma interface, e é incerto que ela melhorará o código, devemos questionar o motivo da existência dela e por que não simplesmente chamar a implementação concreta.

É comum que desenvolvedores exagerem (*overengineer*), tentando adivinhar qual seria o nível perfeito de abstração com base no que acreditam que será necessário no futuro. Porém, isso deve ser evitado, pois, na maioria dos casos, polui o código com abstrações desnecessárias.

**Referência**:  
HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.