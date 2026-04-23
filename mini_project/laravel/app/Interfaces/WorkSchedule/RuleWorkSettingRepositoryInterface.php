<?php

namespace App\Interfaces\WorkSchedule;

interface RuleWorkSettingRepositoryInterface
{
    public function getAll();
    public function findById($id);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
    public function setActive($id);
    public function getActiveRule();
}
