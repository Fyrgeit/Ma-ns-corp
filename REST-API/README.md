# TODO

- [x] 1. Vilka chaufförer jobbar idag? Vilka jobbar på fredag?
/employees/driver/today
/employees/driver/friday
- [x] 2. Finns varan X i lager? Om den gör det, i vilka lager (och hur många) finns?
/products/X
- [x] 3. Vilka ordrar behöver just nu plockas?
/orders?type=placed
- [x] 4. Vilken är den äldsta ordern som har plockats men måste köras ut?
/orders/oldest?type=plocked
- [x] 5. Vilka plockare har just nu inga ordrar att plocka?
/employees/plocker/free
- [x] 6. Vad är den totala kostnaden av alla slutförda ordrar för oktober månad?
/orders/cost_sum?type=delivered&month=9
- [x] 7. Vilken var den dyraste ordern som plockades i augusti månad?
/orders/cost_max?type=delivered&month=7

# Arbetsdagbok

### Före december
Skrev kod som genererar massa dummy-ordrar. Den hittar på tider för färdigställning, men de är ändå rimliga. Lade in ett antal varor och lager manuellt.

### Måndag 4/12
Skrev mer kod för att generera dummy-employees.
Gjorde fråga 1 som var relativt lätt med hjälp av `Date.getDay()` som returnerar ett tal 0-6 beroende på veckodag.
Gjorde även fråga 5. Den var rätt klurig, men genom att kolla genom ordrarna, och vilka employees som var assignade gick det bra.

### Tisdag 5/12
Skrev om en del endpoints för att använda queries och minskade därför antal endpoints.

### Onsdag 6/12
Idag har jag satt igång med mongoose. Jag har lyckats lägga upp allt på databasen och hämtat saker simpelt. Strugglar med querying.

### Måndag 11/12
Lyckades fixa alla querying saker. Använde en kombination av `Query.find()` och `Array.filter()`.

### Onsdag 13/12
Skrev om routingen som en oneliner med groups.