Loops em Go são simples e diretos, mas existe um detalhe importante que pode causar bugs sutis:

> **valores atribuídos dentro de loops são cópias**

## Exemplo

```go
type account struct {
    balance float32
}

accounts := []account{
    {balance: 100.},
    {balance: 200.},
    {balance: 300.},
}

for _, a := range accounts {
    a.balance += 1000
}
```

Qual é o resultado?

- `[{100} {200} {300}]`
- `[{1100} {1200} {1300}]`

Resposta:  
👉 `[{100} {200} {300}]`

## Por que isso acontece?

Em Go, **atribuições fazem cópia**:

- Struct → copia todos os campos  
- Ponteiro → copia o endereço  

Isso não é exclusivo do `range`.

Sempre que você faz algo como:

```go
a := accounts[i]
a.balance += 1000
```

Você está modificando uma **cópia**, não o valor original.

O mesmo acontece dentro de loops.

## Como atualizar os elementos

### 1. Usar índice diretamente

```go
for i := range accounts {
    accounts[i].balance += 1000
}
```

Ou com um `for` tradicional:

```go
for i := 0; i < len(accounts); i++ {
    accounts[i].balance += 1000
}
```

Aqui você acessa o elemento original.

### 2. Usar ponteiros

```go
accounts := []*account{
    {balance: 100.},
    {balance: 200.},
    {balance: 300.},
}

for _, a := range accounts {
    a.balance += 1000
}
```

Agora funciona porque:

- `a` é cópia do ponteiro  
- mas aponta para o mesmo struct  

## Quando evitar ponteiros

Essa abordagem tem desvantagens:

- muda o tipo do slice  
- pode impactar performance (menos previsível para CPU)  

## Regra prática

> Em loops, cuidado: você pode estar trabalhando com cópias.

Se você precisa modificar o dado:

- use índice  
- ou trabalhe com ponteiros (com cuidado)

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.